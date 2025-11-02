const url = 'http://localhost:3000';

await fetch(url + '/register', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@doe.com',
    password: 'password'
  })
});

let res = await fetch(url + '/login', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@doe.com',
    password: 'password'
  })
});

let data = await res.json();
let token = data.token;

await fetch(url + '/todos', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Buy groceries',
    description: 'Buy milk, eggs, and bread'
  })
});

res = await fetch(url + '/todos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

data = await res.json();
console.log(data);

const id = data.data[0].id;

res = await fetch(url + `/todos/${id}`, {
  method: 'put',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Do homework',
    description: 'Complete it by the 11th'
  })
});

res = await fetch(url + '/todos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

data = await res.json();
console.log(data);

const deleteId = data.data[0].id;

await fetch(url + `/todos/${deleteId}`, {
  method: 'delete',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

res = await fetch(url + '/todos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

data = await res.json();
console.log(data);
