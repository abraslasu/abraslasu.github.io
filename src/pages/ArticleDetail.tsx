import { useParams } from 'react-router-dom';

export default function ArticleDetail() {
  const { id } = useParams();
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Article Detail Page</h2>
      <p>Viewing article ID: {id}</p>
    </div>
  );
}
