import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
   id: string
   name: string
   login: string
   avatar_url: string
}

type AuthContextData = {
   user: User | null
   signInUrl: string
   signOut: () => void
}

type AuthResponse = {
   token: string;
   user: {
      id: string;
      avatar_url: string;
      name: string;
      login: string;
   }
}

//Criando o contexto exportando o AuthConextData
export const AuthContext = createContext({} as AuthContextData)

type AuthProvider = {
   children: ReactNode;
}

export function AuthProvider(props: AuthProvider ) {
   //Criando um state que recebe User ou null
   const [user, setUser] = useState<User | null>(null)

   //URL de conexão
   const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=68177a4d58f6c373281a`

   //Função: acessar o backend - Rota: /authenticate e autorizar o User
   async function signIn (githubCode: string) {
      const response = await api.post<AuthResponse>('authenticate', {
         code: githubCode
      })

      const { token, user } = response.data

      //Guardando o token no localStore do navegador
      localStorage.setItem('@dowhile:token', token)

      api.defaults.headers.common.authorization = `Bearer ${token}`

      //Guardando o User no state
      setUser(user)
   }

   //Função: Logout, setando o setUser = null e removendo o token do localStore
   function signOut() {
      setUser(null)
      localStorage.removeItem('@dowhile:token')
   }

   //UseEffect: recupera o code do user
   useEffect(() => {
      //Pega o URL atual
      const url = window.location.href 
      //Verifica se na URL existe o parametro "code"
      const hasGithubCode = url.includes('?code=')

      if (hasGithubCode) {
         //Separa o URL em duas partes localhost:3000 e o code
         const [urlWithoutCode, githubCode] = url.split('?code=')

         //Retira o code da URL
         window.history.pushState({}, '', urlWithoutCode)
         
         //Chama a função SignIn passando o code
         signIn(githubCode)
      }
   }, [])

   //Seta o token como default no localStore 
   useEffect(() => {
      const token = localStorage.getItem('@dowhile:token')

      if (token) {
         api.defaults.headers.common.authorization = `Bearer ${token}`

         api.get<User>('profile').then(response => {
            setUser(response.data)
         })
      }
   }, [])
   
   //value = Retorna tudo do AuthContext
   return (
      <AuthContext.Provider value={{ signInUrl, user, signOut }}>
         {props.children}
      </AuthContext.Provider>
   )
}