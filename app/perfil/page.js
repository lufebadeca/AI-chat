"use client"
import { Header } from "../components/header"
import { useParams, useSearchParams } from "next/navigation";

const Profile = ()=>{

  const params = useSearchParams();
  const userId = params.get("userId");
  
  // const params = useParams();
  // console.log(params);

  return(
    <section>
      <Header/>
      <h2>Perfil de usuario: {userId}</h2>
    </section>
  )
}

export default Profile;