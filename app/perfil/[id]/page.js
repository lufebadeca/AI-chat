"use client"
import { Header } from "../../components/header"
import { collection, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore"; 
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

      /*USE EFFECT PARA SUSCRIBIR A CAMBIOS EN BD
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
      }, []); // Empty dependency array means this effect runs only once, on mount */

  useEffect(() => {
    const docRef = doc(db, "users", params.id);
  
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("Datos actualizados:", userData);
        setImage(userData.image);
        setUser(userData);
      } else {
        console.log("No se encontró el documento");
      }
    });
  
    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, [params.id]); //hook to params.id instead of [], will work also on first render

  useEffect( ()=>{  //get images, hooked to user (profile/active user data)
    const getImages = async ()=>{
      // Create a storage reference from our storage service
      const storageRef = ref(storage, image);
      const imageURL = await getDownloadURL(storageRef);
      //console.log("StorageRef", storageRef,"full URL", imageURL);
      setImage(imageURL); //image state, full URL for rendering
    }
    if(user) {
      getImages();
    }
  }, [user] );

  const [newUserModal, setNewUserModal] = useState(false);

  const pencilStyle="text-[1.2rem] text-gray-400 inline hover:cursor-pointer";

  return(
    <section>

      {newUserModal && 
      <NewUserForm setModal={setNewUserModal} mode="edit" 
      initName={user.name} initLastName={user.lastName}
      initPhone={user.phone} initImgSrc={user.image} pickedUserId={params.id}
      initDescription={user.description} initDob={user.dob}
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
            Teléfono: 
            <span className="text-gray-600 text-[1.3rem] border-1 border-gray-400 bg-white rounded-sm">{user.phone} </span> 
            <span><FaPen className={pencilStyle} onClick={ ()=>setNewUserModal( !newUserModal ) }/></span>
          </h3>

          <h3 className="text-black text-[1.4rem] font-bold">
            Fecha de nacimiento: 
            <span className="text-gray-600 text-[1.3rem] border-1 border-gray-400 bg-white rounded-sm">{user.dob}</span> 
            <span><FaPen className={pencilStyle} onClick={ ()=>setNewUserModal( !newUserModal ) }/></span>
          </h3>

          <article className="text-black text-[1.4rem] font-bold ">
            Sobre mí: 
            <span><FaPen className={pencilStyle} onClick={ ()=>setNewUserModal( !newUserModal ) }/></span>
            <p className="text-gray-600 text-[1rem] border-1 border-gray-400 bg-white rounded-sm">
              {user.description} 
            </p>
          </article>
          
        </section>
        ) :
        (
        <div className="flex justify-center items-center h-[75vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        )

      }
    </section>
  )
}

export default Profile;