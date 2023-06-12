import { destroyCookie } from "nookies";
import { useEffect } from "react";
import Can from "../components/Can";
import { authChannel, useAuthContext } from "../contexts/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import { withSSRAuth } from "../utils/withSSRAuth";

function Dashobard({ user }) {
  const { signOut } = useAuthContext();
  // const { user, signOut } = useAuthContext();

  useEffect(() => {
    api
      .get("/me")
      .then((resp) => console.log(resp))
      .catch((error) => console.log(error));
  }, []);

  return (
    <>
      <h1>user: {user?.email}</h1>
      <button
        onClick={() => {
          signOut();
          authChannel.postMessage("signOut");
        }}
      >
        Sign out
      </button>
      <Can permissions={["metrics.list"]} roles={["administrator"]}>
        <div>metrics</div>
      </Can>
    </>
  );
}

export default Dashobard;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get("/me");

  console.log(">>>>>>>>>", response);
  const user = response.data;
  console.log(user);

  return {
    props: {
      user,
    },
  };
});
