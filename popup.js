document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');
    
    root.addEventListener('click', function(event) {
      event.stopPropagation();
    });
    
    renderLoading();
    
    
    chrome.storage.local.get(['lastCalculatedAverages'], function(result) {
      if (result.lastCalculatedAverages) {
      
        renderData(result.lastCalculatedAverages);
        refreshDataFromPage();
      } else {
        refreshDataFromPage();
      }
    });
    
    function refreshDataFromPage() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (!tabs || tabs.length === 0) {
          renderError("Cannot access the current tab");
          return;
        }
        
        chrome.tabs.sendMessage(tabs[0].id, { action: "getAverages" }, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
            renderError("Could not communicate with the page. Make sure you've refreshed the page after installing the extension.");
            return;
          }
          
          if (response && response.averages) {
            renderData(response.averages);
          } else {
            renderError("No data received from the page");
          }
        });
      });
    }
    
    function renderData(averages) {
      const { sectionAverages, sectionName } = averages;
      
      let sectionsHtml = '';
      for (const [section, avg] of Object.entries(sectionAverages)) {
        sectionsHtml += `
          <div class="section-item">
            <span>${section}:</span>
            <span>${avg}</span>
          </div>
        `;
      }
      
      root.innerHTML = `
        <div class="container">
          <h1>${sectionName || 'Section Averages'}</h1>
          <div class="section-list">
            ${sectionsHtml}
          </div>
          
          <button id="refresh-button" class="refresh-button">Refresh Data</button>
        </div>
      `;
      
      document.getElementById('refresh-button').addEventListener('click', function() {
        renderLoading();
        refreshDataFromPage();
      });
    }
    
    function renderLoading() {
      root.innerHTML = `
        <div class="container">
          <div class="loading">
            <div class="spinner"></div>
          </div>
        </div>
      `;
    }
    
    function renderError(message) {
      root.innerHTML = `
        <div class="container">
          <div class="error-message">
            ${message}
          </div>
          <button id="retry-button" class="retry-button">Retry</button>
        </div>
      `;
      
      document.getElementById('retry-button').addEventListener('click', function() {
        renderLoading();
        refreshDataFromPage();
      });
    }
  });