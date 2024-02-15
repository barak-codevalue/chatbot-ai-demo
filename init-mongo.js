db = db.getSiblingDB('chat-db');
db.createUser({
  user: 'test',
  pwd: 'test',
  roles: [{ role: 'readWrite', db: 'chat-db' }],
});
