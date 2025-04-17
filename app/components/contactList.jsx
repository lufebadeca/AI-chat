import React, { useState, useEffect } from "react";
import { ContactCard } from "./contactCard";
import { BsPersonFillAdd } from "react-icons/bs";
import { NewUserForm } from "./newUserForm";

import { db } from "@/firebaseConfig";  //connect with configFirebase file
import {collection, getDocs, addDoc, onSnapshot} from "firebase/firestore" //access collections and docs
import FilterInput from "./filterInput";
//addDoc will be passed down onto the NewUserModal, snapShot enables listening to real-time updagtes of db

export const ContactList = ({usersList, setUsersList, activeUser, setActiveUser} )=>{

    const [loading, setLoading] = useState(true);
    const [newUserModal, setNewUserModal] = useState(false);

    const [filteredUsers, setFilteredUsers] = useState([]);

    const filterUsers = (filterValue)=>{
        let newList = [...usersList];
        const results = newList.filter( (contact)=>
            contact.name.toLowerCase().includes(filterValue.toLowerCase() ) || 
            contact.lastName.toLowerCase().includes(filterValue.toLowerCase() )
        );
        //console.log(results)
        setFilteredUsers(results);
    }

    //use Effect para escuchar primer carga de datos de firebase a UsersLists
    useEffect(() => {
        filterUsers(""); // o usar el valor actual de búsqueda si lo tenés en un estado
      }, [usersList]);

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

    return(
        <section className="w-1/3 bg-gray-200 p-4 overflow-hidden">

            {  newUserModal && <NewUserForm setModal={setNewUserModal} /> }

            <div className="flex justify-between items-center py-1 mb-2">
                <h2 className="text-2xl font-semibold text-blue-400 flex items-center">Contactos</h2>
                <button
                    onClick={ ()=>setNewUserModal( !newUserModal ) } 
                    className="bg-blue-300 p-1 w-20 h-10 flex justify-center items-center rounded-md text-black hover:bg-blue-400 cursor-pointer active:-translate-y-0.5"
                >
                    <BsPersonFillAdd />
                </button>

            </div>

            <FilterInput filterUsers={filterUsers} ></FilterInput>

            {loading ? (
                <div className="flex justify-center items-center h-[75vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="h-[75vh] overflow-y-auto">
                    {filteredUsers && filteredUsers.map((contact) => (
                        <ContactCard key={contact.id} contact={contact} activeUser={activeUser} setActiveUser={setActiveUser} />
                    ))}
                </div>
            )}
        </section>
    )
}