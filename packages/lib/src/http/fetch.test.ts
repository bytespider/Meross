import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import { fetch } from './fetch.js';

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

// test('fetch makes a successful HTTP GET request', async () => {
//   const response = await fetch('http://jsonplaceholder.typicode.com/posts/1');
//   assert.equal(response.status, 200);
//   const json = await response.json();
//   const data = json as Post;
//   assert.equal(data.id, 1);
// });
