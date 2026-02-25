import { Link } from 'react-router-dom';

export default function Articles() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Articles Page</h2>
      <p className="mb-4">List of articles will go here.</p>
      <ul className="list-disc pl-5">
        <li>
          <Link to="/articles/1" className="text-blue-600 hover:underline">Article 1</Link>
        </li>
        <li>
          <Link to="/articles/2" className="text-blue-600 hover:underline">Article 2</Link>
        </li>
      </ul>
    </div>
  );
}
