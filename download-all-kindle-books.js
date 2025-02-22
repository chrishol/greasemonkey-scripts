// ==UserScript==
// @name         Amazon Kindle Book Downloader Auto Paginate Robust
// @namespace    http://tampermonkey.net/
// @version      0.2.4
// @description  Downloads Kindle books on the page and automatically navigates to the next page using the pageNumber parameter in the URL. If a book isn’t downloadable, it logs the issue and continues.
// @author
// @match        https://www.amazon.com/hz/mycd/digital-console/contentlist/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function() {
  'use strict';

  // When the page loads, add the trigger button (if not already present)
  window.addEventListener('load', function() {
    if (!document.querySelector('#trigger-download-button')) {
      const button = document.createElement('button');
      button.id = 'trigger-download-button';
      button.innerText = 'Trigger Download';
      button.style.position = 'fixed';
      button.style.top = '20px';
      button.style.right = '20px';
      button.style.padding = '10px';
      button.style.fontSize = '16px';
      button.style.backgroundColor = '#4CAF50';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '5px';
      button.style.cursor = 'pointer';
      button.style.zIndex = 9999;
      document.body.appendChild(button);

      // When the button is clicked, set the auto-download flag and process the dropdowns
      button.addEventListener('click', function() {
        localStorage.setItem('autoDownload', 'true');
        processDropdowns();
      });
    }

    // If the auto-download flag is set (from a previous page), automatically start processing
    if (localStorage.getItem('autoDownload') === 'true') {
      setTimeout(() => {
        processDropdowns();
      }, 2000); // delay to allow page elements to load
    }
  });

  // Utility function to simulate clicking an element using a selector
  function clickElement(selector) {
    clickElementWithin(document, selector);
  }

  function clickElementWithin(topElement, selector) {
    const element = topElement.querySelector(selector);
    if (element) {
      element.click();
      console.log(`Clicked: ${selector}`);
    } else {
      console.log(`Element not found: ${selector}`);
    }
  }

  // Processes each dropdown (each book on the page)
  async function processDropdowns() {
    const dropdowns = document.querySelectorAll('[class^="Dropdown-module_container__"]');

    for (let i = 0; i < dropdowns.length; i++) {
      try {
        const dropdown = dropdowns[i];
        dropdown.click();
        console.log(`Dropdown ${i + 1} opened`);

        // Wait for the dropdown to open
        await new Promise(resolve => setTimeout(resolve, 500));

        // Attempt to click the "Download & transfer via USB" option if available
        await new Promise(resolve => setTimeout(() => {
          const container = dropdown.querySelector('[class^="Dropdown-module_dropdown_container__"]');
          if (container) {
            const topDiv = Array.from(container.querySelectorAll('div'))
                              .find(div => div.textContent.includes('Download & transfer via USB'));
            if (topDiv) {
              const inner = topDiv.querySelector('div');
              if (inner) {
                inner.click();
              } else {
                console.log('Inner element for "Download & transfer via USB" not found.');
              }
            } else {
              console.log('Download option not available. Continuing..');
            }
          } else {
            console.log('Dropdown container not found. Likely not downloadable. Continuing..');
          }
          resolve();
        }, 500));

        // Wait a little before moving to the next step
        await new Promise(resolve => setTimeout(resolve, 500));

        // Choose the first Kindle in the list
        await new Promise(resolve => setTimeout(() => {
          clickElementWithin(dropdown, 'span[id^="download_and_transfer_list_"]');
          resolve();
        }, 500));

        // Wait a little before moving to the next step
        await new Promise(resolve => setTimeout(resolve, 500));

        // Click the Download button
        await new Promise(resolve => setTimeout(() => {
          const downloadBtn = Array.from(dropdown.querySelectorAll('[id$="_CONFIRM"]'))
                              .find(div => div.textContent.includes('Download'));
          if (downloadBtn) {
            downloadBtn.click();
          } else {
            console.log('Download button not available. Skipping..');
          }
          resolve();
        }, 500));

        // Wait a little before moving to the next step
        await new Promise(resolve => setTimeout(resolve, 500));

        // Close the success notification
        await new Promise(resolve => setTimeout(() => {
          clickElement('span[id="notification-close"]');
          resolve();
        }, 500));

        // Wait a bit before processing the next dropdown
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (err) {
        console.log(`Error processing dropdown ${i + 1}: ${err}. Continuing to next dropdown.`);
      }
    }

    console.log('All dropdowns processed');
    navigateToNextPage();
  }

  // Navigate to the next page by parsing the URL for pageNumber and incrementing it
  function navigateToNextPage() {
    const url = new URL(window.location.href);
    // Get the current page number; if not present, default to 1
    let currentPage = parseInt(url.searchParams.get('pageNumber')) || 1;
    currentPage++;
    url.searchParams.set('pageNumber', currentPage);
    console.log("Navigating to next page: " + url.href);
    window.location.href = url.href;
  }

  // Add custom CSS to style the button
  GM_addStyle(`
    button {
      font-family: Arial, sans-serif;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }
  `);
})();
