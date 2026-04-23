import React from 'react'
import Menubar from '../component/Menubar'
import Header from '../component/Header'

const Home = () => {
  return (
  <div className='flex flex-col gap-10 relative min-h-100vh bg-neutral-secondary'>
    <Menubar />
    <Header />
  </div>
  )
}

export default Home
