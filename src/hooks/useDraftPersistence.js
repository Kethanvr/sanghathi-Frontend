import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../utils/axios";
import logger from "../utils/logger.js";

const DEFAULT_SCOPE_ID = "default";
const DEFAULT_DEBOUNCE_MS = 2500;
const LOCAL_PREFIX = "sanghathi:draft";

const buildLocalKey = ({ formType, scopeId }) =>
  `${LOCAL_PREFIX}:${formType}:${scopeId || DEFAULT_SCOPE_ID}`;

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const simpleChecksum = (raw) => {
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return String(hash >>> 0);
};

export default function useDraftPersistence({
  formType,
  scopeId = DEFAULT_SCOPE_ID,
  values,
  reset,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  enableServerSync = true,
}) {
  const [syncState, setSyncState] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const timerRef = useRef(null);
  const latestPayloadRef = useRef(null);

  const localKey = useMemo(
    () => buildLocalKey({ formType, scopeId }),
    [formType, scopeId]
  );

  const saveLocal = useCallback(
    (payload) => {
      localStorage.setItem(localKey, JSON.stringify(payload));
      setHasLocalDraft(true);
      setLastSavedAt(payload.updatedAt);
    },
    [localKey]
  );

  const syncToServer = useCallback(
    async (payload) => {
      if (!enableServerSync) return;

      try {
        setSyncState("syncing");
        await api.put(`/forms/drafts/${formType}`, {
          scopeId,
          draftData: payload.draftData,
          version: payload.version,
          checksum: payload.checksum,
          isDirty: true,
        });
        setSyncState("synced");
      } catch (error) {
        setSyncState("error");
        logger.error("Draft server sync failed", error);
      }
    },
    [enableServerSync, formType, scopeId]
  );

  const clearDraft = useCallback(() => {
    localStorage.removeItem(localKey);
    setHasLocalDraft(false);
    setLastSavedAt(null);
    setSyncState("idle");
  }, [localKey]);

  const forceSync = useCallback(async () => {
    if (!latestPayloadRef.current) return;
    await syncToServer(latestPayloadRef.current);
  }, [syncToServer]);

  useEffect(() => {
    const localRaw = localStorage.getItem(localKey);
    const localDraft = safeParse(localRaw);

    if (localDraft?.draftData && typeof reset === "function") {
      reset(localDraft.draftData);
      setHasLocalDraft(true);
      setLastSavedAt(localDraft.updatedAt || null);
    }

    const hydrateFromServer = async () => {
      if (!enableServerSync || typeof reset !== "function") {
        setIsHydrated(true);
        return;
      }

      try {
        const response = await api.get(`/forms/drafts/${formType}`, {
          params: { scopeId },
        });
        const serverDraft = response.data?.data?.draft;

        if (!serverDraft?.draftData) {
          setIsHydrated(true);
          return;
        }

        const serverTime = new Date(serverDraft.updatedAt || 0).getTime();
        const localTime = new Date(localDraft?.updatedAt || 0).getTime();

        if (!localDraft || serverTime > localTime) {
          reset(serverDraft.draftData);
          const syncedLocal = {
            draftData: serverDraft.draftData,
            version: serverDraft.version || 1,
            checksum: serverDraft.checksum || "",
            updatedAt: serverDraft.updatedAt || new Date().toISOString(),
          };
          saveLocal(syncedLocal);
          latestPayloadRef.current = syncedLocal;
        }
      } catch (error) {
        logger.error("Draft server hydrate failed", error);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrateFromServer();
  }, [enableServerSync, formType, localKey, reset, saveLocal, scopeId]);

  useEffect(() => {
    if (!isHydrated || !formType || values === undefined) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        setSyncState("saving-local");
        const serialized = JSON.stringify(values);
        const payload = {
          draftData: values,
          version: 1,
          checksum: simpleChecksum(serialized),
          updatedAt: new Date().toISOString(),
        };

        latestPayloadRef.current = payload;
        saveLocal(payload);
        await syncToServer(payload);
      } catch (error) {
        setSyncState("error");
        logger.error("Draft local save failed", error);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [debounceMs, formType, isHydrated, saveLocal, syncToServer, values]);

  return {
    syncState,
    lastSavedAt,
    hasLocalDraft,
    clearDraft,
    forceSync,
  };
}
