import React from 'react'
import '../styles/userContainer.css'
import { Link } from 'react-router-dom'

export default function UserContainer({name}) {
  return (
    <Link to={`/graphic/${name}`} >
    <div className='user-container'>
        <img src={name + '.png'} alt="" />
        <p>{name}</p>
    </div>
    </Link>
    
  )
}
