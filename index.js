import express from "express";

const obj = {
  a: 1,
  b: 2
};

let copy = { ...obj };

const funky = async () => {
  return "Chicken";
};

funky()
  .then(data => {
    console.log("Data ", data);
  })
  .catch(err => {
    console.log(err);
  });
