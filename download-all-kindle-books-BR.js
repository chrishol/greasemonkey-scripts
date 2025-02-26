// ==UserScript==
// @name         Amazon Kindle Book Downloader
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @description  Adds a button to trigger downloads of all Kindle books on the page
// @author       Chris Hollindale
// @match        https://www.amazon.com.br/hz/mycd/digital-console/contentlist/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function() {
  'use strict';

  // Wait until the page is fully loaded before injecting the button
  window.addEventListener('load', function() {
      // Create a button in the top right of the page to trigger the action
      const button = document.createElement('button');
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

      // Add button to the body
      document.body.appendChild(button);

      // Function to simulate clicking an element
      function clickElement(selector) {
        clickElementWithin(document, selector);
      }

      // Function to simulate clicking an element within a specific selector
      function clickElementWithin(topElement, selector) {
        const element = topElement.querySelector(selector);
        if (element) {
            element.click();
            console.log(`Clicked: ${selector}`);
        } else {
            console.log(`Element not found: ${selector}`);
        }
    }

      // Function to handle processing of each dropdown
      async function processDropdowns() {
          // Get all dropdowns with the class prefix 'Dropdown-module_container__'
          const dropdowns = document.querySelectorAll('[class^="Dropdown-module_container__"]');

          for (let i = 0; i < dropdowns.length; i++) {
              // Open the dropdown
              const dropdown = dropdowns[i];
              dropdown.click();
              console.log(`Dropdown ${i+1} opened`);

              // Wait a moment for the dropdown to open and perform the actions
              await new Promise(resolve => setTimeout(resolve, 500));

              // Now perform the actions on the opened dropdown using wildcard selectors
              await new Promise(resolve => setTimeout(() => {
                  const topDiv = Array.from(dropdown.querySelector('[class^="Dropdown-module_dropdown_container__"]').querySelectorAll('div'))
                                      .find(div => div.textContent.includes('Baixar e transferir por USB'));
                  if (topDiv) {
                    topDiv.querySelector('div').click(); // Download & transfer via USB
                  } else {
                    console.log('Download option not available. Continuing..');
                  }
                  resolve();
              }, 500));

              await new Promise(resolve => setTimeout(() => {
                  clickElementWithin(dropdown, 'span[id^="download_and_transfer_list_"]'); // Choose the first Kindle in list
                  // If you want the second Kindle in the list, change the above line to this instead (for the third, you'd change the [1] to [2] and so on):
                  //   dropdown.querySelectorAll('span[id^="download_and_transfer_list_"]')[1].click();
                  resolve();
              }, 500));

              await new Promise(resolve => setTimeout(() => {
                  const downloadBtn = Array.from(dropdown.querySelectorAll('[id$="_CONFIRM"]'))
                       .find(div => div.textContent.includes('Baixar'));
                  if (downloadBtn) {
                    downloadBtn.click(); // Download
                  } else {
                    console.log('Download button not available. Skipping..');
                  }
                  resolve();
              }, 500));

              await new Promise(resolve => setTimeout(() => {
                  clickElement('span[id="notification-close"]'); // Close success screen
                  resolve();
              }, 500));

              // Wait a little before processing the next dropdown
              // This is set to 5 seconds - you can speed this up even faster if you prefer
              await new Promise(resolve => setTimeout(resolve, 5000));
          }

          console.log('All dropdowns processed');
      }

      // Button click event to start processing all dropdowns
      button.addEventListener('click', function() {
          processDropdowns();
      });
  });

  // Add some CSS to make the button look nice
  GM_addStyle(`
      button {
          font-family: Arial, sans-serif;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
      }
  `);
})();
