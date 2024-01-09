import './App.css';
import { useState, useEffect } from 'react';
import { supabase } from './client'

function refreshPage(){
  window.location.reload(false);
}

function App() {
  const [posts, setPosts] = useState([])
  const [post, setPost] = useState({ service_provider_id: "", status: "", endpoint_url: ""})
  const { service_provider_id, status, endpoint_url } = post

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    const { data } = await supabase
      .from('registry_service_list')
      .select()
    setPosts(data)
    console.log("data: ", data)
  }

  return (
    <div className="Table">
      <table>
        <tr>
          <th>Service Provider ID</th>
          <th>Status Code</th>
          <th>Endpoint URL</th>
        </tr>
        {
          posts.map(post => (
            <tr>
              <th>{post.service_provider_id}</th>
              <th>{post.status}</th>
              <th>{post.endpoint_url}</th>
            </tr>
          ))
        }
      </table>
      <button onClick={refreshPage} id="refreshbutton">Refresh</button>
    </div>


    // <div className="App">
    //   <input 
    //     placeholder="Title"
    //     value={title}
    //     onChange={e => setPost({ ...post, title: e.target.value})} 
    //   />
    //   <input 
    //     placeholder="Content"
    //     value={content}
    //     onChange={e => setPost({ ...post, content: e.target.value})} 
    //   />
    //   <button onClick={createPost}>Create Post</button>
    //   {
    //     posts.map(post => (
    //       <div key={post.id}>
    //         <h3>{post.title}</h3>
    //         <p>{post.content}</p>
    //       </div>
    //     ))
    //   }

    // </div>
  );
}

export default App;
