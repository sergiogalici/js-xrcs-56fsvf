import booleanIntersects from '@turf/boolean-intersects';

// Clonare l'oggetto
export function cloneObject(object) {
  return { ...object };
}

// Unire i due oggetti in un unico, senza modificare gli oggetti originali
export function mergeObjects(object1, object2) {
  return { ...object1, ...object2 };
}

// Dato un oggetto e un array con chiave-valore, aggiungere chiave-valore all'oggetto
// senza modificare l'originale, ma restituendo una copia
export function setProperty(object, [key, value]) {
  // an error inside the name of the function ("setPropery" instead of "setProperty" was properly corrected both in the object.js and in the objects.test.js files)
  return { ...object, [key]: value };
}

// Convertire un oggetto contentene altri oggetti in array
// La chiave di ciascun oggetto va inserita nell'oggetto stesso come `key`
// Es.: { a: { name: 'X' }, b: { name: 'Y' } } diventa [{ key: 'a', name: 'X' }, b: { key: 'b', name: 'Y' }]
export function toArray(object) {
  return Object.entries(object).map(([key, values]) => {
    let obj = { key: key };
    for (let value in values) {
      obj[value] = object[key][value];
    }
    return obj;
  });
}

// Dato un oggetto, restituire un nuovo oggetto mantenendo
// soltanto le chiavi i cui valori soddisfano la funzione `predicate` (a cui bisogna passare sia la chiave, sia il valore)
// Es.: { name: 'Kate', number1: 100, number2: 40, number3: 77 } con predicate = (key, value) => key === 'name' || value > 50
// restituisce  { name: 'Kate', number1: 100, number3: 77 }
export function filterObject(object, predicate) {
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (predicate(key, value)) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

// Data una chiave `key`, una funzione `getValue` per ottenere il valore associato a quella chiave e un oggetto `cache`,
// `getCachedValue` deve chiamare una sola volta `getValue` e conservare il valore ottenuto, in modo che se
// la funzione viene richiamata successivamente con la stessa chiave, venga restituito il valore senza richiamare `getValue`
export function getCachedValue(key, getValue, cache) {
  if (!cache.hasOwnProperty(key)) {
    cache[key] = getValue(key);
  }
  return cache[key];
}

// Dato un array bidimensionale, dove ogni array interno è una coppia chiave-valore, convertirlo in un oggetto
// Es.: [['name', 'John'], ['age', 22]] diventa { name: 'John', age: 22 }
export function arrayToObject(array) {
  return Object.fromEntries(array);
}

// Come `arrayToObject`, ma tutti i valori di tipo array devono a loro volta essere trasformati in oggetti
// Controllare il test per vedere dato iniziale e risultato finale
export function arrayToObjectDeep(array) {
  return array.reduce((objToReturn, c) => {
    if (Array.isArray(c[1])) {
      objToReturn[c[0]] = arrayToObjectDeep(c[1]);
      // uses recursion to properly get the correct value in an array with depth N
    } else {
      objToReturn[c[0]] = c[1];
    }
    return objToReturn;
  }, {});
}

// Dato un oggetto e una funzione `predicate` da chiamare con la coppia chiave-valore,
// restituire true se almeno una delle proprietà dell'oggetto soddisfa la funzione `predicate`.
// Es.: { name: 'Mary', age: 99, children: 4 } con predicate = (key, value) => value > 10
// ritorna true perché è presente una proprietà maggiore di 10 (age)
export function hasValidProperty(object, predicate) {
  return Object.entries(object).some(([key, value]) => predicate(key, value));
}

// Dato un oggetto, estrarre tutti i valori che sono a loro volta oggetti in un oggetto separato, usando come chiave il loro id;
// rimuovere la chiave nell'oggetto di partenza e sostituirla con `{nome_chiave}Id` e usare come valore l'id dell'oggetto estratto.
// Es.: { id: 1, name: 'John', car: { id: 33, manufacturer: 'Ford' } } restituisce due oggetti:
// { id: 1, name: 'John', carId: 33 } e l'altro { 33: { id: 33, manufacturer: 'Ford' } }
// Ritornare un array con i due oggetti (vedere il test per altri esempi)
// Idealmente dovrebbe funzionare per ogni oggetto trovato dentro l'oggetto di partenza, anche quelli annidati
export function normalizeObject(object) {
  return Object.entries(object).reduce(
    ([a, b], [key, value]) => {
      if (typeof value !== 'object') {
        a[key] = value;
        return [a, b];
      }
      if (typeof value === 'object') {
        a[`${key}Id`] = Object.entries(value)[0][1];
        // get the first value of the object to not hardcode "value.id" (it could have another name)
        const [recursiveA, recursiveB] = normalizeObject(value);
        // uses recursion to properly receive any nested objects inside of "value"
        b = { ...b, ...recursiveB, [value.id]: recursiveA };
        return [a, b];
      }
    },
    [{}, {}]
  );
}

// Dato un tree del tipo
// 1.       A
//        / | \
// 2.    B  C  D
//      / \
// 3.  E   F
// restituire la profondità (in questo caso 3)
// Il tree ha la seguente struttura: { value: 'A', children: [{ value: 'B', children: [...] }, { value: 'C' }] }
export function getTreeDepth(tree) {
  let depth = 1;
  if (tree.children) {
    depth += tree.children.reduce((max, child) => {
      const depthOfChild = getTreeDepth(child);
      return depthOfChild > max ? depthOfChild : max;
    }, 0);
  }
  return depth;
}

// Dato un tree come sopra, contare il numero di nodi "leaf", cioè quelli senza ulteriori figli (0 children)
// Considerando l'esempio sopra, i nodi "leaf" sono 4 (C, D, E, F)
export function countTreeLeafNodes(tree) {
  if (!tree.children) {
    return 1;
  }
  return tree.children.reduce(
    (nodes, child) => nodes + countTreeLeafNodes(child),
    0
  );
}

// Dati un oggetto e un path di tipo stringa, `get` deve restituire la proprietà al path specificato.
// Se path contiene punti, si tratta di proprietà annidate. `get` deve funzionare anche con gli array,
// specificando un numero come indice. Se la proprietà non esiste ritornare fallback o undefined.
// Es. 1: { address: { city: 'New York' } } e 'address.city' ritorna 'New York'
// Es. 2: { movies: ['Shrek', 'Shrek 2'] } e 'movies.1' ritorna 'Shrek 2'
export function get(object, path, fallback) {
  let value = object;
  const pathParts = path.split('.');
  for (const part of pathParts) {
    if (value == null || !(part in value)) {
      return fallback;
    }
    if (Array.isArray(value)) {
      const index = Number(part);
      if (Number.isNaN(index)) {
        return fallback;
      }
      value = value[index];
    } else {
      value = value[part];
    }
  }
  return value;
}

// Dato un oggetto con una struttura non uniforme contentente informazioni geografiche
// su strade e punti di interesse, generare un oggetto GeoJSON (RFC 7946) valido.
// NOTA: per avere un'idea dell'input vedere il test corrispondente,
// per il GeoJSON finale da generare vedere il file `mock.js`.
export function createGeoJSON(data) {
  const pointsOfInterestFeatures = data.pointsOfInterest.map((c) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [c.coordinates.lng, c.coordinates.lat],
    },
    properties: {
      name: c.name,
    },
  }));

  const streetsFeatures = data.streets.map((street) => {
    const segments = JSON.parse(street.polyline);
    const coordinates = segments.map((c) => [c.start.lng, c.start.lat]);
    coordinates.push([
      segments[segments.length - 1].end.lng,
      segments[segments.length - 1].end.lat,
    ]);

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: coordinates,
      },
      properties: {
        lanes: street.extraProps.lane,
        name: street.name,
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features: [...pointsOfInterestFeatures, ...streetsFeatures],
  };
}

// Dati un array contentente le coordinate [lng, lat] di alcune geometrie (linee e punti),
// e un punto con coordinate [lng, lat], stabilire se il punto interseca una o più geometrie del primo array.
// Se sì, convertire l'array in un oggetto GeoJSON valido, dove la/le feature intersecate
// hanno `highlighted: true` all'interno dell'oggetto `properties`. Se il punto non interseca nulla, ritornare null.
// Per vedere i dati in input e il risultato finale, fare riferimento ai test.
// NOTA: usare booleanIntersects (https://turfjs.org/docs/#booleanIntersects) per controllare se una geometria ne interseca un'altra.
export function highlightActiveFeatures(geoJSON, point) {
  const features = geoJSON.map(([type, coordinates]) => {
    const geoJSONFeature = {
      type: 'Feature',
      geometry: {
        type: type === 'point' ? 'Point' : 'LineString',
        coordinates: coordinates,
      },
    };
    if (
      booleanIntersects(geoJSONFeature, {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: point },
      })
    ) {
      geoJSONFeature.properties = { highlighted: true };
    }
    return geoJSONFeature;
  });

  const geoJSONObject = {
    type: 'FeatureCollection',
    features: features,
  };
  if (
    features.some(
      (feature) => feature.properties && feature.properties.highlighted
    )
  ) {
    return geoJSONObject;
  }
  return null;
}
