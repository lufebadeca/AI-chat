import React from "react";
import Link from "next/link";

export const Header = ()=>{

    return(
    <nav className="w-full flex justify-between p-4 bg-blue-600 text-white text-lg font-semibold shadow-md">
        
        <Link href="/">
            <h2>Messaging App</h2>
        </Link>
        <ul className="flex gap-4">
            <Link href="/">Chat</Link>
            <Link href="/perfil">Ver perfil</Link>
        </ul>
    </nav>
    )
}