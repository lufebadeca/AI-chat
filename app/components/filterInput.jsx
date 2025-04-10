import React, { useState } from "react";

const FilterInput = ({filterUsers})=>{

  const [filterValue, setFilterValue] = useState("");

  const handleFilter = (e)=>{
    const newValue = e.target.value;
    setFilterValue(newValue);
    filterUsers(newValue); // ✅ acá sí tiene el valor actualizado
  }


  return(
    <>
      <input className="bg-white border-2 border-black text-blue-400 rounded-md mb-3" type="text" onChange={handleFilter} 
        placeholder="Buscar contacto..." value={filterValue}>
      </input>
    </>
  )
}

export default FilterInput;