export default function Styleguide() {
  const colors = [
    { name: 'Palette 1', var: 'var(--color-palette-1)', hex: '#F5F3F1', text: 'black' },
    { name: 'Palette 2', var: 'var(--color-palette-2)', hex: '#E7E7E7', text: 'black' },
    { name: 'Palette 3', var: 'var(--color-palette-3)', hex: '#C9C9C9', text: 'black' },
    { name: 'Palette 4', var: 'var(--color-palette-4)', hex: '#A1A1A1', text: 'black' },
    { name: 'Palette 5', var: 'var(--color-palette-5)', hex: '#000000', text: 'white' },
    { name: 'Palette 6', var: 'var(--color-palette-6)', hex: '#FFFFFF', text: 'black' },
  ];

  const typography = [
    { label: 'Heading 1', class: 'typo-h1', text: 'Heading 1 Display' },
    { label: 'Heading 2', class: 'typo-h2', text: 'Heading 2 Title' },
    { label: 'Heading 3', class: 'typo-h3', text: 'Heading 3 Subtitle' },
    { label: 'Heading 4', class: 'typo-h4', text: 'Heading 4 Section' },
    { label: 'Leading Paragraph', class: 'typo-leading-p', text: 'This is a leading paragraph text that stands out more than the regular body text.' },
    { label: 'Paragraph', class: 'typo-p', text: 'This is a standard paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    { label: 'Caption', class: 'typo-caption', text: 'This is a caption text.' },
    { label: 'Quote', class: 'typo-quote', text: 'This is a quote style text.' },
  ];

  const fluidSizes = [
    '--fluid-160-800',
    '--fluid-56-80',
    '--fluid-48-72',
    '--fluid-40-56',
    '--fluid-40-48',
    '--fluid-32-40',
    '--fluid-24-28',
    '--fluid-22-25',
    '--fluid-21-24',
    '--fluid-18-21',
    '--fluid-20-20',
    '--fluid-16-16',
  ];

  return (
    <div className="p-8 space-y-16 bg-palette-1 min-h-screen">
      <section>
        <h2 className="text-3xl font-bold mb-8 border-b border-black pb-2">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {colors.map((color) => (
            <div key={color.name} className="space-y-2">
              <div 
                className="h-32 w-full rounded-lg shadow-md border border-gray-200 flex items-center justify-center"
                style={{ backgroundColor: color.hex, color: color.text }}
              >
                <span className="font-mono">{color.hex}</span>
              </div>
              <div className="text-sm font-medium">{color.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8 border-b border-black pb-2">Typography</h2>
        <div className="space-y-12">
          {typography.map((item) => (
            <div key={item.label} className="border-b border-gray-300 pb-8 last:border-0">
              <div className="text-xs font-mono text-gray-500 mb-2">{item.label} ({item.class})</div>
              <div className={item.class}>
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8 border-b border-black pb-2">Fluid Spacing / Sizing</h2>
        <div className="space-y-4">
          {fluidSizes.map((size) => (
            <div key={size} className="flex items-center gap-4">
              <div className="w-48 font-mono text-xs shrink-0">{size}</div>
              <div 
                className="bg-palette-4 h-8 rounded"
                style={{ width: `var(${size})` }}
              ></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
