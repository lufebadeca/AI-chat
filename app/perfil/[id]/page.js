"use client"
import { Header } from "../../components/header"
import { collection, doc, setDoc, getDoc } from "firebase/firestore"; 
import { ref, getStorage, getDownloadURL, uploadBytesResumable } from "firebase/storage"; 
import { db, storage } from "@/firebaseConfig";  //connect with configFirebase file
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { NewUserForm } from "@/app/components/newUserForm";
import { FaCamera } from "react-icons/fa6";
import { FaPen } from "react-icons/fa6";


const Profile = ()=>{

  const params = useParams();
  const [user, setUser] = useState();

  const [image, setImage] = useState(); //hardcoded image
  const [uploadImageModal, setUploadImageModal] = useState();

  console.log(params);

  useEffect( ()=>{  //get user data, hooked to first render []
    const  getUserData = async()=>{
      const docRef = doc(db, "users", params.id);
      const userSnap = await getDoc(docRef);
      const userData = userSnap.data();

      //console.log(JSON.stringify(userData));
      console.log((userData));
      setImage(userData.image);
      setUser(userData);
    }
    getUserData();
  }, []
  );

  useEffect( ()=>{  //get images, hooked to user (profile/active user data)
    const getImages = async ()=>{
      console.log(image);
      // Get a reference to the storage service, which is used to create references in your storage bucket
      if (!image) {
        console.error("No image provided for storage reference.");
        return;
      }
      // Create a storage reference from our storage service
      const storageRef = ref(storage, image);
      const imageURL = await getDownloadURL(storageRef);
      console.log("full URL", imageURL);
      setImage(imageURL); //image state, full URL for rendering
    }
    getImages();
  }, [image] );

  const [newUserModal, setNewUserModal] = useState(false);

  const pencilStyle="text-[1.2rem] text-gray-400 inline hover:cursor-pointer";

  return(
    <section>

      {newUserModal && 
      <NewUserForm setModal={setNewUserModal} mode="edit" 
      initName={user.name} initLastName={user.lastName}
      initPhone={user.phone} initImgSrc={user.image} pickedUserId={params.id}
      /> }

      <Header/>
      { user ? 
        (
        <section className="bg-gray-100 p-4 flex flex-col justify-start items-start border-b min-h-[100vh]">

          <div className="relative">

            <img src={image} className="w-38 h-38 rounded-full border-3 border-gray-300"></img>
            <div className="bg-gray-400/70 w-13 h-13 p-2 text-2xl rounded-full absolute top-24 left-24 hover:cursor-pointer">
              <FaCamera className="text-white-300 text-[2rem] m-auto" onClick={ ()=>setUploadImageModal( !uploadImageModal ) }/>
            </div>

          </div>

          <h2 className="text-black text-[2.5rem] font-bold">
            {user.name} {user.lastName} <span> <FaPen className={pencilStyle} onClick={ ()=>setNewUserModal( !newUserModal ) }/></span>
          </h2>

          <h3 className="text-black text-[1.4rem] font-bold">
            Teléfono: {user.phone} <span><FaPen className={pencilStyle} onClick={ ()=>setNewUserModal( !newUserModal ) }/></span>
          </h3>
          
        </section>
        ) :
        <p>Cargando...</p>
      }
    </section>
  )
}

export default Profile;