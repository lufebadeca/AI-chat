"use client"

import Image from "next/image";
import { Header } from "./components/header";
import { ChatWindow } from "./components/chatWindow";
import { ContactList } from "./components/contactList";
import { useEffect, useState } from "react";
import { Container } from "./components/container";


export default function Home() {

  const [activeUser, setActiveUser] = useState("");
  const [usersList, setUsersList] = useState([]);

  useEffect( ()=>{

    const loadUsers = async ()=>{
      const response = await fetch("https://randomuser.me/api/?results=15");
      const res= await response.json();
      setUsersList(res.results);
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
