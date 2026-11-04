import {useState} from 'react';

const images = [
  '/src/assets/images/carousel_salon_1_1793799835801.jpg',
  '/src/assets/images/carousel_salon_2_1793799837071.jpg',
];

export function Carousel() {
  const [index, setIndex] = useState(0);
  return (
    <div className="relative w-full h-64 overflow-hidden rounded-2xl">
      <img src={images[index]} alt="Salon" className="w-full h-full object-cover" />
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {images.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? 'bg-gold-500' : 'bg-gray-500'}`} />
        ))}
      </div>
    </div>
  );
}
