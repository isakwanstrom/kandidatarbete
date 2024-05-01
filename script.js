window.onload = function() {
  loadXMLandXSLT();
  document.addEventListener('click', handleItemClick);
};

function handleItemClick(event) {
  const target = event.target;

  // Hantera endast klick på rubriker
  if (target.classList.contains('heading1') || target.classList.contains('heading2') || target.classList.contains('heading3')) {
    const parentHeading = target.closest('.heading1, .heading2, .heading3');

    // Kontrollera om elementet har ett ID innan URL uppdateras
    if (!parentHeading.id) {
      console.log("ID saknas, tilldelar nu...");
      assignUniqueIds();
    }

    // Uppdatera URL efter att ID har tilldelats
    updateUrl(parentHeading);

    // Hantera innehållsvisning och döljning
    const content = parentHeading.nextElementSibling;
    if (content) {
      toggleContentDisplay(target, content);
    }
  }
}

function toggleContentDisplay(target, content) {
  if (content.style.display === 'block') {
    content.style.display = 'none';
    target.classList.remove('expanded');
  } else {
    content.style.display = 'block';
    target.classList.add('expanded');
  }
}

function updateUrl(element) {
  if (!element.id) {
    console.error("Element saknar ID, kan inte uppdatera URL.");
    return;
  }

  let path = [];
  while (element) {
    if (element.id) {
      path.unshift(element.id);
    }
    element = element.parentElement.closest('.heading1, .heading2, .heading3');
  }

  let newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?section=${path.join('_')}`;
  console.log("Uppdaterar URL till:", newUrl);
  window.history.pushState({ path: newUrl }, '', newUrl);
}




function expandSectionFromUrl() {
  const sectionId = new URLSearchParams(window.location.search).get('section');
  if (sectionId) {
    const elementToExpand = document.getElementById(sectionId);
    if (elementToExpand) {
      showContentAndParents(elementToExpand);
      elementToExpand.scrollIntoView();
    }
  }
}

function showContentAndParents(element) {
  console.log("Starting expansion for element:", element.id);
  let currentElement = element;
  expandElement(currentElement); // Expand the initially selected element

  // Adjusted to correctly navigate through potentially nested `li` elements
  while (currentElement && currentElement.parentElement && currentElement.parentElement.parentElement) {
    // Move to the parent LI of the current LI (jump two levels up)
    const parentLi = currentElement.parentElement.parentElement.closest('li');
    if (parentLi) {
      const parentHeading = parentLi.querySelector('.heading1, .heading2, .heading3');
      if (parentHeading && parentHeading !== currentElement) {
        console.log("Found heading parent:", parentHeading.id);
        expandElement(parentHeading);
        currentElement = parentHeading; // Update currentElement to parent for next iteration
      } else {
        console.log("No further heading parent found or reached the highest level.");
        break; // Exit if no further parent heading is found
      }
    } else {
      console.log("Reached the outermost LI or no LI found.");
      break;
    }
  }
}

function expandElement(element) {
  const content = element.nextElementSibling;
  if (content && content.classList.contains('content')) {
    console.log("Expanding content for", element.id);
    content.style.display = 'block'; // Ensure content is visible
    element.classList.add('expanded'); // Mark the element as expanded
  } else {
    console.log("No content to expand for", element.id);
  }
}



window.addEventListener('popstate', expandSectionFromUrl);
document.addEventListener('DOMContentLoaded', expandSectionFromUrl);

async function loadXMLandXSLT() {
  try {
      // Hämtar XML-filen först och väntar på att den ska bli klar innan den går vidare
      const xmlResponse = await fetch('ut_export.xml');
      const xmlText = await xmlResponse.text();
      let xml = new DOMParser().parseFromString(xmlText, 'text/xml');

      // Hämtar sedan XSLT-filen och väntar på att den ska bli klar
      const xslResponse = await fetch('transformation.xsl');
      const xslText = await xslResponse.text();
      let xsl = new DOMParser().parseFromString(xslText, 'text/xml');

      // När båda filerna är laddade och omvandlade till DOM-strukturer, utföra transformationen
      transformXML(xml, xsl);

      // Visa rubriktexten vid laddning av sidan
      const rubrikTextElements = document.querySelectorAll('.rubriktext');
      rubrikTextElements.forEach(element => {
          element.style.display = 'block';
      });
  } catch (error) {
      console.error('Error loading XML or XSLT:', error);
  }
}


function transformXML(xml, xsl) {
  let xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(xsl);

  let resultDocument = xsltProcessor.transformToFragment(xml, document);
  document.getElementById('content').innerHTML = '';
  document.getElementById('content').appendChild(resultDocument);

  assignUniqueIds();
  expandSectionFromUrl();  // Flytta anropet hit så det säkert körs efter all transformation och ID-tilldelning
}


function generateSlug(text) {
  return text.toLowerCase().replace(/[\s\W-]+/g, '-');
}

function assignUniqueIds() {
  const headings = document.querySelectorAll('.heading1, .heading2, .heading3');
  const idCounts = {};
  headings.forEach(heading => {
    let baseId = generateSlug(heading.textContent || 'section');
    let id = baseId;
    let count = 1;

    while (document.getElementById(id)) {
      id = `${baseId}-${count++}`;
    }

    heading.id = id;
    idCounts[baseId] = count;
  });
}