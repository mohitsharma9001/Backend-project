// How to find true false members and count users
[
  {
    $match: {
      isActive: true,
    },
  },
  {
    $count: "activeUser",
  },
][
  // To find the average based on gender
  {
    $group: {
      _id: "$gender",
      avrageAge: {
        $avg: "$age",
      },
    },
  }
];

// List the top 5 most common fav fruits among the users
[
    {
      $group: {
        _id: "$favoriteFruit",
        count : {
          $sum : 1
        }
      },
    },
    {
      $sort: {
        count : -1
      }
    },
    {
      $limit: 5
    }
  ]


