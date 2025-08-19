export const Header = () => {
  return (
    <div className="w-full">
      <div
        className="w-full h-48 md:h-56 lg:h-80 bg-cover bg-center relative"
        style={{
          backgroundImage:
            `url(/haval.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-gray-900/90"></div>
      </div>
    </div>
  )
}
