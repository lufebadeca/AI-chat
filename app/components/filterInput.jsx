import React, { useState } from "react";

const FilterInput = ({filterUsers})=>{

  const [filterValue, setFilterValue] = useState("");

  const handleFilter = (e)=>{
    const newValue = e.target.value;
    setFilterValue(newValue);
    filterUsers(newValue); // ✅ acá sí tiene el valor actualizado
  }


  return(
    <div className="w-full">
      <input className="bg-white text-blue-400 w-full border-black border-2 rounded-md mb-3" type="text" onChange={handleFilter} 
        placeholder="Buscar contacto..." value={filterValue}>
      </input>
    </div>
  )
}

export default FilterInput;