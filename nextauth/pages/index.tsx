import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { FormEvent, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import styles from "../styles/Home.module.css";
import { withSSRGuest } from "../utils/withSSRGuest";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isAuthenticated, signIn } = useAuthContext();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = {
      email,
      password,
    };

    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <input
        type="email"
        value={email}
        onChange={({ target }) => setEmail(target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={({ target }) => setPassword(target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );
}

export const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {},
  };
});
