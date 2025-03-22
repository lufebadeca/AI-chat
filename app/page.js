"use client";

import Image from "next/image";
import { Header } from "./components/header";
import { ChatWindow } from "./components/chatWindow";
import { ContactList } from "./components/contactList";
import { useEffect, useState } from "react";
import { Container } from "./components/container";

import { db } from "@/firebaseConfig";  //connect with configFirebase file
import {collection, getDocs} from "firebase/firestore" //access collections and docs


export default function Home() {

  const [activeUser, setActiveUser] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  //use effect 
  useEffect( ()=>{

    const loadUsers = async ()=>{
      /*const response = await fetch("https://randomuser.me/api/?results=15");
      const res= await response.json();
      setUsersList(res.results);*/

      const usersCollection = collection(db, "users");
      const usersRaw = await getDocs(usersCollection);
      const users = usersRaw.docs.map( user=> user.data() );
      console.log(users);
      setUsersList(users);

    }
    loadUsers();
  }, []);

  return (
    <section className="flex flex-col h-max">
      <Header></Header>
      <Container usersList={usersList} activeUser={activeUser} setActiveUser={setActiveUser}></Container>
    </section>
  );
}
