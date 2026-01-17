import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'  
// axios used  for handling request from the server same as fetch but way more better because no use of .parse and .json etc axios do these function automatically

import { useEffect } from 'react'

function App() {
  const [jokes, setJokes] = useState([])

  useEffect(()=>{
    axios.get('/api/jokes')
    .then((response) =>{
     // console.log(response.data);
      setJokes(response.data)
    })
    .catch((error)=>{
      console.log(error);
      
    })
  })

  return (
    <>
      <h1 className='bg-blue'>hello this is frontend</h1>
      <p>Jokes : {jokes.length} </p>
    {
      // in maps return must be used if not them paranthesis is used instead of curly braces
    jokes.map((joke,index)=>(
      <div key={joke.id}>
        <h2>{joke.title}</h2>
        <p>{joke.content}</p>
      </div>
    ))
}
    </>
  )
}

export default App
