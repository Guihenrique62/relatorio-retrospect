import React from 'react'
import '../styles/userContainer.css'

export default function UserContainer({name}) {
  return (
    <div className='user-container'>
        <img src={name + '.png'} alt="" />
        <p>{name}</p>
    </div>
  )
}
