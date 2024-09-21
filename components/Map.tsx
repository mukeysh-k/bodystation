import React from 'react'

const Map = () => {
  return (
    <div className='py-10'>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3379.5884108867713!2d76.2684996764286!3d32.10740787395066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391b4ff9ff30b8a7%3A0xab7c1d61a87d222a!2sBody%20Station%20The%20Fitness%20Gym!5e0!3m2!1sen!2sin!4v1726922709009!5m2!1sen!2sin"
        width="100%"
        height="450"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}

export default Map
