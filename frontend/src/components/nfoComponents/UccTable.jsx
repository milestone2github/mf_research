import React from 'react'
import { BsInfoCircleFill } from "react-icons/bs";

const taxStatusMap = new Map([
  ["INDIVIDUAL", "IND"],
  ["NRI - REPATRIABLE (NRO)", ""]
])

const holdingMap = new Map([
  ["SINGLE", "SI"],
  ["JOINT", "JO"],
  ["ANYONE OR SURVIVOR", "AS"],
  [null, "N/A"]
])

function UccTable({ data, selectedOption, updateSelected }) {

  const handleChange = (e) => {
    updateSelected(data.filter(item => item["_id"] === e.target.value)[0])
  }

  return (
    <table className='border border-gray-200 border-collapse text-sm text-left rounded-md'>
      <caption className="caption-top text-left mb-1 text-sm text-gray-800 font-medium">
        UCC
      </caption>
      <thead className='border-2 bg-slate-200'>
        <tr >
          <th className='p-1 pe-6 text-left text-nowrap'>Action</th>
          <th className='p-1 pe-8 text-left text-nowrap min-w-32'>Client Name</th>
          <th className='p-1 pe-8 text-left text-nowrap min-w-32'>Joint 1</th>
          <th className='p-1 pe-8 text-left text-nowrap '>Joint 2</th>
          <th className='p-1 pe-8 text-left'>Tax status</th>
          <th className='p-1 pe-8 text-left'>Holding</th>
          <th className='p-1 pe-8 text-left'>Status</th>
          <th className='p-1 pe-8 text-left text-nowrap'>Bank Detail</th>
          <th className='p-1 pe-8 text-left'>Nominee</th>
        </tr>
      </thead>
      <tbody>{
        data?.map(item => (
          
          <tr key={item._id} className='border-b relative border-gray-200'>
            <td className='p-1 pe-6'>
            <label htmlFor={item._id} className={`cursor-pointer rounded ${item._id === selectedOption._id ? 'bg-blue-100 border-blue-200' : 'bg-gray-100 border-gray-200'} border h-full px-4 py-2 flex items-center`}>
              <input
                type="radio"
                className='cursor-pointer'
                name="ucc"
                id={item._id}
                value={item["_id"]}
                required={true}
                checked={selectedOption._id === item["_id"]}
                onChange={handleChange}
              />
              </label>
            </td>
            <td title={item["Primary_Holder_First_Name"]} className='pe-6 py-2 ellipsis max-w-44'>{item["Primary_Holder_First_Name"]}</td>
            <td className='p-1 pe-6 py-2 max-w-40'>{item["Second_Holder_First_Name"]}</td>
            <td className='p-1 pe-6 py-2 max-w-40'>{item["Third_Holder_First_Name"]}</td>
            <td className='p-1 pe-6 py-2'>{item["Tax_Status"]}</td>
            <td className='p-1 pe-6 py-2'>{holdingMap.get(item["Holding_Nature"])}</td>
            <td className='p-1 pe-6 py-2'>Active</td>
            <td className='p-1 pe-6 py-2'>{item["Bank_Name_1"]? `${item["Bank_Name_1"]?.split(' ')[0]}/${item["Account_No_1"]?.slice(-4)}` : 'N/A'}</td>
            <td className='p-1 py-2 relative'>
              <div className='flex items-center justify-between gap-x-4'>
              {
              item["Nominee_1_Name"] ||
                item["Nominee_2_Name"] ||
                item["Nominee_3_Name"] ? 'YES' : "NO"}
              <span className='group h-fit p-0 flex items-center '>
                <span className='text-blue-300 text-lg w-6 h-6 flex items-center justify-center '><BsInfoCircleFill /></span>

                <div className="absolute right-0 bottom-0 w-max px-2 py-2 border hidden group-hover:block rounded-md bg-white text-sm shadow-md">
                  {item["Nominee_1_Name"] ||
                    item["Nominee_2_Name"] ||
                    item["Nominee_3_Name"] ? <p className='text-xs text-green-700'>Nominees present</p>
                    : <p className='text-xs text-red-700'>No Nominees present</p>
                  }
                  <div className="mt-1 flex flex-col gap-y-2">
                    {item["Nominee_1_Name"] && <p className='border-t'>{item["Nominee_1_Name"]}</p>}
                    {item["Nominee_2_Name"] && <p className='border-t'>{item["Nominee_2_Name"]}</p>}
                    {item["Nominee_3_Name"] && <p className='border-t'>{item["Nominee_3_Name"]}</p>}
                  </div>
                </div>
              </span>
              </div>
            </td>
            
          </tr>
        ))
      }
      </tbody>
    </table>
  )
}

export default UccTable