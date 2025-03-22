import React, { useState } from "react";
import { db } from "@/firebaseConfig";  //connect with configFirebase file
import { collection, addDoc } from "firebase/firestore"; 

export const NewUserForm = ( {setModal, handleAddUser} )=>{

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageSrc, setImageSrc] = useState("");

  const handleModal = (e)=>{
    if ( e.target.id==="modal" ){
      setModal(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = {
      name: name,
      lastName: lastName,
      phone: phone,
      image: imageSrc
    };  // Create a new user object

    handleAddUser(newUser);  // Call the onAddUser prop with the new user object
    setName('');
    setLastName('');
    setPhone('');
    setImageSrc('');
    setModal(false);
  };

  const handleClick = async ()=>{
    const saveUser = await addDoc( collection(db, "users"),{
      name: name,
      lastName: lastName,
      phone: phone,
      image: imageSrc
    } );

    setModal(false);
  }

  return(
    <section 
        id="modal"
        className="absolute left-0 top-0 bg-black/50 w-full h-full flex justify-center items-center"
        onClick={ handleModal }
    >
        <article className="bg-gray-100 text-black p-6 h-100 w-100 flex flex-col justify-between">
            <h1 className="text-xl bold text-center">Agregar nuevo contacto</h1>
            <div className="flex justify-between">
                <label htmlFor="nombre">Nombre:</label>
                <input type="text" id="nombre" className="border-gray-400 border-1 mx-3"
                  value={name}
                  onChange={ (e)=>setName(e.target.value) }
                />
            </div>

            <div className="flex justify-between">
                <label htmlFor="last-name">Apellido:</label>
                <input type="text" id="last-name" className="border-gray-400 border-1 mx-3"
                  value={lastName}
                  onChange={(e)=>setLastName(e.target.value)}
                />
            </div>

            <div className="flex justify-between">
                <label htmlFor="phone">Teléfono:</label>
                <input type="text" id="phone" className="border-gray-400 border-1 mx-3"
                  value={phone}
                  onChange={(e)=>setPhone(e.target.value)}
                />
            </div>

            <div className="flex justify-between">
                <label htmlFor="image-url">Ruta Imagen:</label>
                <input type="text" id="image-url" className="border-gray-400 border-1 mx-3"
                  value={imageSrc}
                  onChange={(e)=>setImageSrc(e.target.value)}
                />
            </div>

            <button
                onClick={ handleSubmit }
                className="bg-blue-300 p-1 rounded-md text-black hover:bg-blue-400 cursor-pointer active:-translate-y-0.5"
            >
                Agregar
            </button>

            <button
                onClick={()=>setModal(false)}
                className="bg-red-300 p-1 rounded-md text-black hover:bg-red-400 cursor-pointer active:-translate-y-0.5"
            >
                Cerrar
            </button>
        </article>
    </section>
  )
}