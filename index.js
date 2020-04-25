//Generating random number between 0 to 1
req_num = Math.random()

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */

const strings1 = {
  h1: 'Hi there! Meet Variant 1!',
  p: 'Customized page with modified tags and urls. Clear the cookies and go to Variant 2 for LinkedIn profile link',
  a: 'Click to see my GitHub Profile',
  title: 'Welcome here!'
}
const strings2 = {
  h1: 'Hi there! Meet Variant 2!',
  p: 'Customized page with modified tags and urls. Clear the cookies and go to Variant 1 for GitHub profile link',
  a: 'Click to see my LinkedIn Profile',
  title: 'Welcome here!'
}

const attribute = 'href';

const urls = {
  git_url: 'https://github.com/rohitrawat13396',
  linkedin_url: 'https://www.linkedin.com/in/rawatroh/'
}

// CLass which modifies the HTML on the basis of tagNames and attributes
// Replacing the Cloudflare url with my GitHub and LinkedIn Profiles URLs
class ElementHandler {

  element(element) {
    if(req_num <0.5){
      const string1 = strings1[element.tagName]
      if (string1) {
        element.setInnerContent(string1)
        if (element.tagName == 'a'){
          element.setAttribute(attribute,urls.git_url)
        }
      }
    }

    if (req_num >=0.5){
      const string2 = strings2[element.tagName]
      if(string2){
        element.setInnerContent(string2)
        if (element.tagName == 'a'){
          element.setAttribute(attribute,urls.linkedin_url)
        }
      }
    }
  }
}

//  Funtion to fetch the response from a url
function fetching(fetch_url){

  const response = fetch(fetch_url)
  return response
}


async function handleRequest(request) {
  
  fetch_url = 'https://cfw-takehome.developers.workers.dev/api/variants';

  const COOKIE_NAME = 'cookie_name'
  //fetching the main url which contains array of two urls
  const response_var = await fetching(fetch_url)
  const result_var = await response_var.json()

  // fetching response from url of variant 1
  response = await fetching(result_var.variants[0])
  // Using HTMLRewriter to modify the html of variant 1
  EH1 = new ElementHandler(req_num)
  Variant1_Response = new HTMLRewriter().on('*', EH1).transform(response)

  // fetching response from url of variant 2
  response = await fetching(result_var.variants[1])
  // Using HTMLRewriter to modify the html of variant 2
  EH2 = new ElementHandler(req_num)
  Variant2_Response = new HTMLRewriter().on('*', EH2).transform(response)

  // Reading the cookie for the page
  const cookie = request.headers.get('cookie')

  // Checking the cookie with type of variant
  if (cookie && cookie.includes(`${COOKIE_NAME}=variant1`)) {
    
    return Variant1_Response  // Return Variant 1 respones
  }
  else if (cookie && cookie.includes(`${COOKIE_NAME}=variant2`)) {
   
    return Variant2_Response  // Return Variant 2 respones
  } 
  else{
    // When the user is new, then send him to random variant page
    // A/B testing paradigm used, equal probability for both the variants
    let variant = req_num < 0.5 ? 'variant1' : 'variant2' 
    let New_response = variant === 'variant1' ? Variant1_Response : Variant2_Response

    //Setting the Cookie for this new user
    New_response.headers.append('Set-Cookie', `${COOKIE_NAME}=${variant};`)
    
    return New_response
  }
}

