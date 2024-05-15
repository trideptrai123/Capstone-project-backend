const express = require('express');
const router = express.Router();

router.get('/university', (req, res) => {
  const universityData = [
    {
      id: 1,
      name: 'ĐH bách khoa HCM',
      city: 'HCM',
      website: 'http://www.example.com',
      Address: '123 Example Street',
      Chancellor: 'tripp',
    },

    {
      id: 2,
      name: 'ĐH bách khoa HN',
      city: 'HN',
      website: 'http://www.example.com',
      Address: '123 Example Street',
      Chancellor: 'tripp',
    },
    {
      id: 3,
      name: 'ĐH bách khoa Đn',
      city: 'ĐN',
      website: 'http://www.example.com',
      Address: '123 Example Street',
      Chancellor: 'tripp',
    },
  ];
  res.send(universityData);
});

module.exports = router;
