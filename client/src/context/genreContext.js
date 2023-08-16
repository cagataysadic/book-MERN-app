import React, { createContext, useState } from 'react';

export const GenreContext = createContext();

export const GenreProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const handleGenreClick = (genre) => {
    if ( selectedGenre === genre) {
        setSelectedGenre(null);
    } else {
        setSelectedGenre(genre);
    }
};

  return (
    <GenreContext.Provider value={{ genres, setGenres, selectedGenre, setSelectedGenre, handleGenreClick }}>
      {children}
    </GenreContext.Provider>
  );
};