const user10 = Object.freeze({
  id: 10,
  name: 'Clementina DuBuque',
  username: 'Moriah.Stanton',
  email: 'Rey.Padberg@karina.biz',
  address: Object.freeze({
    street: 'Kattie Turnpike',
    suite: 'Suite 198',
    city: 'Lebsackbury',
    zipcode: '31428-2261',
    geo: Object.freeze({
      lat: '-38.2386',
      lng: '57.2232',
    }),
  }),
  phone: '024-648-3804',
  website: 'ambrose.net',
  company: Object.freeze({
    name: 'Hoeger LLC',
    catchPhrase: 'Centralized empowering task-force',
    bs: 'target end-to-end models',
  }),
});

export const users = Object.freeze([user10]);

// addressChanges è un oggetto che contiene una o più proprietà di Address da cambiare, ad esempio { city: London }
// Ritornare l'array di utenti con le proprietà cambiate, mantenendo invariate quelle non presenti in addressChanges
export const changeUsersAddress = (users, addressChanges) => {
  // considers "users" as an array of users istead of a single user (user10)
  return users.map((user, index) => {
    const userToReturn = { ...user };
    Object.entries(userToReturn).forEach(([uKey, uValue]) => {
      if (typeof uValue === 'object') {
        const valurArr = [uValue];
        userToReturn[uKey] = changeUsersAddress(valurArr, addressChanges)[
          index
        ];
        //uses recursion to get any possible nested object
      } else {
        Object.entries(addressChanges).forEach(([aKey, aValue]) => {
          if (
            userToReturn.hasOwnProperty(aKey) &&
            userToReturn[aKey] !== addressChanges[aKey]
          ) {
            userToReturn[aKey] = aValue;
          }
        });
      }
    });
    return userToReturn;
  });
};

// Ritornare l'array di utenti senza geo in address
export const removeAddressCoordinates = (users) => {
  return users.map((user, index) => {
    const userToReturn = { ...user };
    Object.entries(userToReturn).forEach(([uKey, uValue]) => {
      if (uKey === 'geo') {
        delete userToReturn[uKey];
      }
      if (uKey !== 'geo' && typeof uValue === 'object') {
        const valueArr = [uValue];
        userToReturn[uKey] = removeAddressCoordinates(valueArr)[index];
        // uses recursion to make the function work with any possible object structure
      }
    });
    return userToReturn;
  });
};

// Ritornare l'array di utenti senza company
export const removeCompanyInfo = (users) => {
  return users.map((user, index) => {
    const userToReturn = { ...user };
    Object.entries(userToReturn).forEach(([uKey, uValue]) => {
      if (uKey === 'company') {
        delete userToReturn[uKey];
      }
      if (uKey !== 'company' && typeof uValue === 'object') {
        const valueArr = [uValue];
        userToReturn[uKey] = removeCompanyInfo(valueArr)[index];
        // uses recursion to make the function work with any possible object structure
      }
    });
    return userToReturn;
  });
};

// Aggiungere newUser a users e ritornare l'array
export const addNewUser = (users, newUser) => {
  return users.reduce(
    (acc, _) => {
      acc.push(newUser);
      return acc;
    },
    [...users]
  );
};

// Ritornare l'array di utenti con lat e lng dentro geo convertiti in numero, non stringa
export const convertUsersGeoToNumber = (users) => {
  return users.map((user, index) => {
    const userToReturn = { ...user };
    Object.entries(userToReturn).forEach(([uKey, uValue]) => {
      if (uKey === 'lat' || uKey == 'lng') {
        userToReturn[uKey] = Number(userToReturn[uKey]);
      }
      if (!(uKey === 'lat' || uKey == 'lng') && typeof uValue === 'object') {
        const valueArr = [uValue];
        userToReturn[uKey] = convertUsersGeoToNumber(valueArr)[index];
        // uses recursion to make the function work with any possible object structure
      }
    });
    return userToReturn;
  });
};
