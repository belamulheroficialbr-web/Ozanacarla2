export function Vitrine() {
  const services = [
    {name: 'Manicure', img: '/src/assets/images/service_showcase_1_1793799836251.jpg'},
    {name: 'Spa Treatment', img: '/src/assets/images/service_showcase_2_1793799836229.jpg'},
  ];
  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      {services.map((s, i) => (
        <div key={i} className="bg-gray-900 p-2 rounded-2xl">
          <img src={s.img} alt={s.name} className="w-full aspect-square object-cover rounded-xl" />
          <p className="mt-2 text-center text-sm text-gold-500">{s.name}</p>
        </div>
      ))}
    </div>
  );
}
