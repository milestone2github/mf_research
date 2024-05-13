import { createAsyncThunk } from "@reduxjs/toolkit";
const baseUrl = `${process.env.REACT_APP_API_BASE_URL}/api`
console.log('baseurl: ', baseUrl) //test

// Async thunk for fetching AMC name options
export const fetchInvestorData = createAsyncThunk(
  'optionLists/fetchInvestorData',
  async (query) => {
    let params = '';

    if('investorName' in query && query.investorName.length) {
      params = `name=${query.investorName}`
    }
    else if('panNumber' in query && query.panNumber.length) {
      params = `pan=${query.panNumber}`
    }
    else if('familyHead' in query && query.familyHead.length) {
      params = `fh=${query.familyHead}`
    }
    else return [];
    
    try {
      // add searchall to the query param string 
      params += `&searchall=${query.searchAll}`;

      // make api request to search investors 
      const response = await fetch(`${baseUrl}/investors/?${params}`, {
        method: 'GET'
      }); 
      const data = await response.json();

      if(!response.ok) {
        throw new Error('Unable to fetch investor data')
      }
      return data; 
    } catch (error) {
      console.log(error)
    }
  }
);

// Async thunk for fetching AMC name options
export const fetchAmcNameOptions = createAsyncThunk(
  'optionLists/fetchAmcNameOptions',
  async (keywords) => {
    if(!keywords.length)
      return [];

    try {
      const response = await fetch(`${baseUrl}/amc/?keywords=${keywords}`, {
        method: 'GET'
      }); 
      const data = await response.json();
      if(!response.ok) {
        throw new Error('Unable to fetch AMC names')
      }
      return data; 
    } catch (error) {
      console.log(error)
    }
  }
);

// Async thunk for fetching Folio Options
export const fetchFolioOptions = createAsyncThunk(
  'optionLists/fetchFolioOptions',
  async ({iWell, amcName}) => {
    if(!iWell || !amcName)
      return [];

    try {
      const response = await fetch(`${baseUrl}/folios?iwell=${iWell}&amcName=${amcName}`, {
        method: 'GET'
      }); 
      const data = await response.json();
      if(!response.ok) {
        throw new Error('Unable to fetch Folios')
      }
      return data; 
    } catch (error) {
      console.log(error)
    }
  }
);

// Async thunk for fetching scheme name Options
export const fetchSchemeNameOptions = createAsyncThunk(
  'optionLists/fetchSchemeNameOptions',
  async ({amc, keywords}) => {
    if(!keywords.length)
      return [];

    try {
      const response = await fetch(`${baseUrl}/schemename?amc=${amc}&keywords=${keywords}`, {
        method: 'GET'
      }); 
      const data = await response.json();
      if(!response.ok) {
        throw new Error('Unable to fetch Scheme names')
      }
      return data; 
    } catch (error) {
      console.log(error)
    }
  }
);