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

await fetch(url + '/register', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Jane Doe',
    email: 'jane@doe.com',
    password: 'password'
  })
});

await fetch(url + '/register', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Mark Doe',
    email: 'mark@doe.com',
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

res = await fetch(url + '/login', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'jane@doe.com',
    password: 'password'
  })
});

data = await res.json();
token = data.token;

await fetch(url + '/todos', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Do homework',
    description: 'Complete homework by 11th'
  })
});

res = await fetch(url + '/todos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

data = await res.json();
console.log(data);

res = await fetch(url + '/login', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'mark@doe.com',
    password: 'password'
  })
});

data = await res.json();
token = data.token;

await fetch(url + '/todos', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Manage project',
    description: 'Hire some project managers'
  })
});

res = await fetch(url + '/todos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

data = await res.json();
console.log(data);
