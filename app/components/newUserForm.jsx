import React, { useState } from "react";
import { db, storage } from "@/firebaseConfig";  //connect with configFirebase file
import { collection, doc, getDoc, setDoc } from "firebase/firestore"; 
import { ref, uploadBytes, getStorage } from "firebase/storage"; 

export const NewUserForm = ( 
    {setModal, mode="", initName="", initLastName="", initPhone="", initImgSrc="", pickedUserId=""} 
  )=>{

  const [name, setName] = useState(initName);
  const [lastName, setLastName] = useState(initLastName);
  const [phone, setPhone] = useState(initPhone);
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState();

  const handleModal = (e)=>{
    if ( e.target.id==="modal" ){
      setModal(false);
    }
  }

  const uploadImage = async (file)=>{
    // Upload file and metadata to the object 'images/mountains.jpg'
    console.log(file);
    if (!file) return;
    const storageRef = ref( storage, `user-images/${file.name}` );
    const response = await uploadBytes(storageRef, file, {contentType: file.type } );
    console.log(response);
    return response.metadata.fullPath;  //returns fbase URL path
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userImageURL = await uploadImage(imageFile);  //first upload file (state) loaded in input, retrieve firebase URL
    //WATCH OUT: image state not updated immediately, would save empty string

    // Call the onAddUser prop with the new user object
    mode==="edit" ? handleEditUser(): handleAddUser(userImageURL);  

    setName('');
    setLastName('');
    setPhone('');
    setImage('');

    setModal(false);
  };

  const handleAddUser = async (userImageURL)=>{
    const newUser = await doc( collection(db, "users"));

    console.log("image to save", image)
    await setDoc(newUser, {
      id: newUser.id,
      name: name,
      lastName: lastName,
      phone: phone,
      image: userImageURL //|| "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
    } );
    setModal(false);
  }

  const handleEditUser = async ()=>{
    const docRef = doc(db, "users", pickedUserId);
    const userSnap = await getDoc(docRef);
    const userData = userSnap.data();

    await setDoc(docRef, {
      //id: newUser.id,
      name: name || userData.name,
      lastName: lastName || userData.lastName,
      phone: phone || userData.phone,
      image: image || userData.image
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
            
            <h1 className="text-xl bold text-center">{mode==="edit" ? "Editar usuario":"Agregar nuevo usuario"}</h1>
            
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
                <label htmlFor="image">Imagen:</label>
                <input type="file" id="image" className="border-gray-400 border-1 mx-3"
                  onChange={ (e)=>setImageFile(e.target.files[0]) }
                />
            </div>

            <button
                onClick={ handleSubmit }
                className="bg-blue-300 p-1 rounded-md text-black hover:bg-blue-400 cursor-pointer active:-translate-y-0.5"
            >
                Guardar
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