import { Container } from "@mui/material";
import Page from "../../components/Page";
import UserList from "../Users/UserList";

export default function ViewUsers() {
  return (
    <Page title="View Users">
      <Container maxWidth="lg">
        <UserList />
      </Container>
    </Page>
  );
}