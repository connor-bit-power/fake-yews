{showContentBox && articleDetails.length > 0 && (
    <div className="content-box">
      {typeof articleDetails[0] === 'string' ? (
        <p>{articleDetails[0]}</p>
      ) : (
        <>
          <h3>{articleDetails[0]?.article_title || "Title not available"}</h3>
          <p>{articleDetails[0]?.body_text || "Content not available"}</p>
        </>
      )}
    </div>
  )}


  