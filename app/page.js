"use client";

import Image from "next/image";
import { Header } from "./components/header";
import { ChatWindow } from "./components/chatWindow";
import { ContactList } from "./components/contactList";
import { useEffect, useState } from "react";
import { Container } from "./components/container";

export default function Home() {

  const [activeUser, setActiveUser] = useState("");
  const [usersList, setUsersList] = useState([]);

  return (
    <section className="flex flex-col h-max">
      <Header/>
      <Container
        usersList={usersList}
        setUsersList={setUsersList}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
      />
    </section>
  );
}
