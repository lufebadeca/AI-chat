import React, { useState } from "react";
import { db, storage } from "@/firebaseConfig";  //connect with configFirebase file
import { collection, doc, getDoc, setDoc } from "firebase/firestore"; 
import { ref, uploadBytes, getStorage, getDownloadURL } from "firebase/storage"; 

export const NewUserForm = ( 
    {setModal, mode="", initName="", initLastName="", initPhone="", initDob="",initDescription="", initImgSrc="", pickedUserId=""} 
  )=>{

  const [name, setName] = useState(initName);
  const [lastName, setLastName] = useState(initLastName);
  const [phone, setPhone] = useState(initPhone);
  const [dob, setDob] = useState(initDob);
  const [description, setDescription] = useState(initDescription);
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(); //state for image file to load

  const [previewImage, setPreviewImage] = useState(null);

  const handleModal = (e)=>{
    if ( e.target.id==="modal" ){
      setModal(false);
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
        const imageUrl = URL.createObjectURL(file);
        setPreviewImage(imageUrl);
    }
  };

  const uploadImage = async (file)=>{
    // Upload file and metadata to the object 'images/mountains.jpg'
    console.log(file);
    if (!file) return;
    const storageRef = ref( storage, `user-images/${file.name}` ); //create a fire-storage ref to upload to
    //console.log(storageRef);
    const response = await uploadBytes(storageRef, file, {contentType: file.type } ); //upload the file
    //console.log(response);    //and get the response object, which has the firestorage path in metadata

    const savedPicRef = ref(storage, response.metadata.fullPath); //fullPath is fbase URL path, creates a ref
    const imageURL = await getDownloadURL(savedPicRef);  //get full|absolute URL of loaded file
    console.log(storageRef===savedPicRef);

    return imageURL;  //returns image state, full URL for rendering
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullImageURL = await uploadImage(imageFile);  //first upload file (state) loaded in input, retrieve firebase URL
    //WATCH OUT: image state not updated immediately, would save empty string
    //console.log(firebaseImageURL);
    //const fullImageURL = await getFullImageURL(firebaseImageURL);
    console.log(fullImageURL);
    // Call the onAddUser prop with the new user object
    mode==="edit" ? handleEditUser(): handleAddUser(fullImageURL);  

    setName('');
    setLastName('');
    setPhone('');
    setDob('');
    setDescription('');
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
      description: description,
      dob: dob,
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
      description: description || userData.description,
      dob: dob || userData.dob,
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
        <article className="bg-gray-100 text-black p-6 h-125 w-100 flex flex-col justify-between">
            
            <h1 className="text-xl bold text-center">{mode==="edit" ? "Editar usuario":"Agregar nuevo usuario"}</h1>
            
            <div className="flex justify-between">
                <label htmlFor="nombre">Nombre:</label>
                <input type="text" id="nombre" className="border-gray-400 border-1 mx-3 cursor-"
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
                <label htmlFor="date">Fecha de nacimiento:</label>
                <input type="date" id="date" className="border-gray-400 border-1 mx-3"
                  value={dob}
                  onChange={(e)=>setDob(e.target.value)}
                />
            </div>

                <label htmlFor="image">Sube tu imagen:</label>
            <div className="flex justify-between items-center border-1 bg-gray" id="image">
                <input type="file" id="image" className="border-gray-400 border-1 mx-3 text-xs cursor-pointer"
                  accept="image/*"
                  onChange={ handleImageChange }
                />
                <img
                  src={previewImage || "https://static.vecteezy.com/system/resources/previews/026/631/445/non_2x/add-photo-icon-symbol-design-illustration-vector.jpg"}
                  alt="Vista previa"
                  className="w-10 h-10 object-cover rounded-md border"
                />
            </div>

            <div className="flex justify-between flex-col">
                <label htmlFor="description">Descripción:</label>
                <textarea type="text" id="description" className="border-gray-400 border-1"
                  value={description}
                  onChange={(e)=>setDescription(e.target.value)}
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