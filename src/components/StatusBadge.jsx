const colors = {
  'New':'bg-gray-100 text-gray-800',
  'Contacted':'bg-blue-100 text-blue-800',
  'Registered':'bg-indigo-100 text-indigo-800',
  'Interested':'bg-amber-100 text-amber-800',
  'Call Back':'bg-yellow-100 text-yellow-800',
  'Follow-Up':'bg-purple-100 text-purple-800',
  'Not Interested':'bg-red-100 text-red-800',
  'Enrolled':'bg-green-100 text-green-800'
}
export default function StatusBadge({ name }){
  return <span className={`px-2 py-1 text-xs rounded-md ${colors[name]||'bg-gray-100 text-gray-800'}`}>{name}</span>
}
