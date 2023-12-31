import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

function Metrics() {
  return (
    <>
      <h1>metrics</h1>
    </>
  );
}

export default Metrics;

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get("/me");

    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list3"],
    roles: ["administrator"],
  }
);
