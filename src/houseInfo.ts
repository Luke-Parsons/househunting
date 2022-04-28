import fetch from "node-fetch";


interface Address {
    _about: string;
    county: string;
    district: string;
    paon: string;
    postcode: string;
    street: string;
    town?: string;
    type?: string[];
  }

export const getHouseAddress = async (
    doorNumber: string,
    postcode: string
  ): Promise<Address[]> => {
    let url = `https://landregistry.data.gov.uk/data/ppi/address.json?_page=0&postcode=${postcode}`;
    console.log("url", url);
    let response = await fetch(url);
    let data: any = await response.json();
    console.log(data);
    let properties: any[] = data.result.items.filter((e: any) =>
      e.paon.includes(doorNumber)
    );
  
    if (properties.length === 0) {
      url = `https://landregistry.data.gov.uk/data/ppi/address.json?_page=0&paon=${doorNumber}&postcode=${postcode}`;
      console.log("url", url);
      response = await fetch(url);
      data = await response.json();
      console.log(data);
      return data.result.items;
    }
  
    console.log("properties", properties);
    return properties;
  };

// https://www.tax.service.gov.uk/check-council-tax-band/search
// csrfToken: 2c896e23154dc8dcdb4a33481c822a0209d1f6d8-1646907934234-86aea7cdd70f63e8c22f11be
// postcode: e153pj
// Search:

// Location: /check-council-tax-band/search?postcode=23d0za5vZI4f-dnZdUuk9Q

// https://www.tax.service.gov.uk/check-council-tax-band/search?postcode=23d0za5vZI4f-dnZdUuk9Q