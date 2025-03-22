"use client";

import Image from "next/image";
import { Header } from "./components/header";
import { ChatWindow } from "./components/chatWindow";
import { ContactList } from "./components/contactList";
import { useEffect, useState } from "react";
import { Container } from "./components/container";

import { db } from "@/firebaseConfig";  //connect with configFirebase file
import {collection, getDocs, addDoc, onSnapshot} from "firebase/firestore" //access collections and docs
//addDoc will be passed down onto the NewUserModal, snapShot enables listening to real-time updagtes of db


export default function Home() {

  const [activeUser, setActiveUser] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set up a real-time listener
  useEffect( ()=>{
    const usersCollection = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id, // **Crucially important:  Include the document ID**
        ...doc.data()
      }));
    setUsersList(usersData);
    setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs only once, on mount


  const handleAddUser = async (newUserObj) => {
    try {
      await addDoc(collection(db, "users"), newUserObj);
      // No need to manually update the state here.  The real-time listener will handle it.
      console.log("User added successfully!");
    } catch (error) {
      console.error("Error adding user:", error);
      // Handle the error in the UI (e.g., display an error message)
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  /*use effect 
  useEffect( ()=>{
    const loadUsers = async ()=>{
      //const response = await fetch("https://randomuser.me/api/?results=15");
      //const res= await response.json();
      //setUsersList(res.results);

      const usersCollection = collection(db, "users"); //sets the collection name
      const usersRaw = await getDocs(usersCollection); //query to db
      const users = usersRaw.docs.map( user=> user.data() ); //process the query response
      console.log(users);
      setUsersList(users);
    }
    loadUsers();
  }, []);*/

  return (
    <section className="flex flex-col h-max">
      <Header/>
      <Container
        usersList={usersList}
        setUsersList={setUsersList}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
        handleAddUser={handleAddUser}
      />
    </section>
  );
}
