import axios, { Axios, AxiosError } from "axios";
import { Router } from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

interface AxiosErrorResponse {
  code?: string;
}

// indentifica se está atualizando o token ou não
let isRefreshing = false;
// fila de requisições q deram falha por causa do token expirado
let failedRequestsQueue = [];

// necessário a opção de receber um contexto (casos de acessar cookies através do servidor (SSR))
export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["nextauth.token"]}`,
    },
  });

  // resp.use recebe 2 funções como paramento
  // primeira: o que fazer se a resp for success (nesse caso, não faremos nada)
  // primeira: o que fazer se a resp der erro (nesse caso, não faremos nada)
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError<AxiosErrorResponse>) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === "token.expired") {
          // renovar token
          cookies = parseCookies(ctx);
          const { "nextauth.refreshToken": refreshToken } = cookies;

          const originalConfig = error.config;
          // console.log(">>>>>>>", originalConfig);
          // console.log("--------", failedRequestsQueue);

          if (!isRefreshing) {
            isRefreshing = true;
            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data;
                setCookie(ctx, "nextauth.token", token, {
                  maxAge: 60 * 60 * 25 * 30, // 30 days
                  path: "/",
                });
                setCookie(
                  ctx,
                  "nextauth.refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 25 * 30, // 30 days
                    path: "/",
                  }
                );
                api.defaults.headers["Authorization"] = `Bearer ${token}`;

                failedRequestsQueue.forEach((request) =>
                  request.onSuccess(token)
                );
                failedRequestsQueue = [];
              })
              .catch((err) => {
                failedRequestsQueue.forEach((request) =>
                  request.onFailure(err)
                );
                failedRequestsQueue = [];

                // indica se o código está sendo executado no lado do browser
                if (process.browser) {
                  // typeof window !== undefined
                  console.log("Client");
                  return signOut();
                } else {
                  console.log("Server");
                  return Promise.reject(new AuthTokenError());
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              // executa caso o processo de refreshToken tenha dado certo
              // tenta fazer a requisição novamente porem com o token atualizado
              onSuccess: (token: string) => {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;
                resolve(api(originalConfig));
              },
              // executa caso o processo de refreshToken tenha dado errado
              onFailure: (erro: AxiosError) => {
                reject(error);
              },
            });
          });
        } else {
          if (process.browser) {
            signOut();
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}
