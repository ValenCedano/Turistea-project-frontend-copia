import React, { useEffect, useState } from "react";
import { Link,  useParams} from "react-router-dom";
import { getAuth } from "firebase/auth";
import {getDoc, doc, updateDoc } from "firebase/firestore";
import { database } from "../firebase/firebaseConfig";
import { setCheckboxes, toggleCheckbox } from "../redux/planSavings/savingsSlice";
import { useDispatch } from "react-redux";

const calculateCheckboxes = (startDate, endDate, periodicity) => {
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const checkboxes = [];
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  let currentDate = start;

  const periodMap = {
    Semanal: 7,
    Quincenal: 15,
    Mensual: 30,
  };

  const daysToAdd = periodMap[periodicity];

  while (currentDate <= end) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + daysToAdd);

    if (nextDate > end) {
      nextDate.setTime(end.getTime());
    }

    checkboxes.push({
      dateRange: `${currentDate.toLocaleDateString(
        "en-GB"
      )} - ${nextDate.toLocaleDateString("en-GB")}`,
      checked: false,
    });

    currentDate = new Date(nextDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return checkboxes;
};

const ViewDetails = () => {
  const {idPlan} = useParams();
  const idPlanVerdadero = String(idPlan.substring(1));
  const [reviews, setReviews] = useState([]);
  const [Periodicidad, setPeriodicidad] = useState("");
  const [FechaInicio, setFechaInicio] = useState("");
  const [FechaFinalizacion, setFechaFinalizacion] = useState("");
  const [cuota, setCuota] = useState("");
  const [Total, setotal] = useState(" ");
  const [idDocumento, setDocumento] = useState("");
  const [dataBoxes, setBoxes] = useState([]);
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();
  
  

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const docRef = doc(database, "SavingsPlan", idPlanVerdadero);

        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const ahorroData = docSnap.data();
            const { frecuency, dateStart, dateEnd, travels, total, savings, datesBox } = ahorroData;

            setPeriodicidad(frecuency);
            setFechaInicio(dateStart);
            setFechaFinalizacion(dateEnd);
            setCuota(savings);
            setotal(total);
            setReviews(travels || []);
            setBoxes(datesBox || calculateCheckboxes(dateStart, dateEnd, frecuency));
            dispatch(setCheckboxes(datesBox || calculateCheckboxes(dateStart, dateEnd, frecuency)));
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching document: ", error);
        }
      }
    };

    fetchData();
  }, [idDocumento, dispatch]);

  const handleCheckboxChange = async (index, checked) => {
    
  
    const newBoxes = dataBoxes.map((box, i) => {
      if (i === index) {
        return { ...box, checked };
      }
      return box;
    });
    setBoxes(newBoxes);

    const progreso = (newBoxes.filter(box => box.checked).length / newBoxes.length) * 100;
    setProgress(progreso);

    

    if (idDocumento) {
      const docRef = doc(database, "SavingsPlan", idDocumento);
      try {
        await updateDoc(docRef, {
          datesBox: newBoxes,
          progreso: progreso
        });
        
      } catch (error) {
        console.error("Error al actualizar el progreso ", error);
      }
    }
  };
  


  const calculateProgress = (checkboxes) => {
    const total = checkboxes.length;
    const checked = checkboxes.filter(box => box.checked).length;
    const progressPercentage = (checked / total) * 100;
    setProgress(progressPercentage);
  };

  useEffect(() => {
    calculateProgress(dataBoxes);

  
  }, [dataBoxes]);





  return (
    <section className="flex justify-between w-full h-screen px-10 py-5 mb-4 md:px-10 md:py-10 sm:flex-col sm:justify-center md:flex-row sm:px-10 max-[760px]:flex-col  " >
      <div className="rounded-lg w-1/2 shadow shadow-2xl p-6 border h-full md:w-1/2 flex flex-col items-center max-[760px]:w-full">
        <div className="w-full">
          <h2 className="font-semibold w-full mb-2 text-lg md:text-2xl font-title text-highlight-color ">
            Mi Viaje
          </h2>
        </div>
        
        {Array.isArray(reviews) && reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ul key={index} className="overflow-auto mb-2 w-full">
              <li className="w-full flex p-4 mt-2 shadow-xl rounded-lg border">
                <div className="h-24 w-2/4 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={review.mainImage}
                    alt="producto2"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="ml-4 w-2/5 flex flex-1 flex-row items-center">
                  <div className="w-full flex flex-col">
                    <p className="text-gray-input text-xs md:text-sm">
                      {review.typeReviews ? review.typeReviews : "Sin información"}
                    </p>
                    <Link className="text-sm md:text-base font-bold">
                      {review.namePlace ? review.namePlace : "Sin información"}
                    </Link>
                    <p className="text-gray-input text-xs md:text-sm">
                      {review.location ? review.location : "Sin información"}
                    </p>
                    <p className="text-sm md:text-base font-semibold">
                      {review.price ? review.price : "Sin información"}
                      <span className="inline font-normal text-gray-input">
                        /
                        {review.typeReviews ? (
                          review.typeReviews.toLowerCase() === "alojamiento"
                            ? "noche"
                            : review.typeReviews.toLowerCase() === "alimentación"
                            ? "plato"
                            : review.typeReviews.toLowerCase() === "planes"
                            ? "actividad"
                            : null
                        ) : null}
                      </span>
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          ))
        ) : (
          <p>No hay datos de viajes disponibles.</p>
        )}
        

        <div className="w-full flex flex-col pt-4 mt-6 border-t border-gray-input">
          <div className="w-full flex justify-between">
            <p className="w/1/2 text-sm md:text-base font-semibold text-start font-body text-black-text">
              Total
            </p>
            <p className="w-1/2 text-sm md:text-base font-semibold text-end font-body text-black-text">
              {Total ? `${Total}` : "Sin informacion"}
            </p>
          </div>
        </div>
      </div>
      <div className="px-5 w-1/2 md:w-5/12  bg-secondary max-[760px]:w-full max-[760px]:mt-10 ">
        <h1 className="w-full mb-6 text-base sm:text-2xl md:text-3xl font-title text-highlight-color">
          Tu Ahorro
        </h1>
        <div className="w-full">
          <div className="flex items-center">
            <h2 className="mr-2 text-body font-semibold text-lg md:text-xl text-primary-color">
              Periodicidad:
            </h2>
            <p className="inline text-gray-cards text-body text-sm md:text-base">
              {Periodicidad ? Periodicidad : "Sin informacion"}
            </p>
          </div>
          <div className="flex items-center">
            <h2 className="mr-2 text-body font-semibold text-lg md:text-xl text-primary-color">
              Valor:
            </h2>
            <p className="inline text-gray-cards text-body text-sm md:text-base">
              {cuota ? cuota : "Sin informacion"}
            </p>

          </div>
          <div className="flex items-center">
            <h2 className="mr-2 text-body font-semibold text-lg md:text-xl text-primary-color">
              Fecha Inicio:
            </h2>
            <p className="inline text-gray-cards text-body text-sm md:text-base">
              {FechaInicio ? FechaInicio : "Sin informacion"}
            </p>
          </div>
          <div className="flex items-center">
            <h2 className="mr-2 text-body font-semibold text-lg md:text-xl text-primary-color">
              Fecha Finalización:
            </h2>
            <p className="inline text-gray-cards text-body text-sm md:text-base">
              {FechaFinalizacion ? FechaFinalizacion : "Sin informacion"}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-body font-semibold text-lg md:text-xl mt-6 mb-4 text-black-text">
            Tu Progreso
          </h2>
          <div className="relative w-full bg-gray-300 rounded-full h-6">
            <div
              className="bg-primary-color h-6 rounded-full"
              style={{ width: `${progress}%` }}
            />
            <span className="absolute left-0 right-0 text-center text-xs font-medium text-primary-color">
              {Math.round(progress)}%
            </span>
          </div>
          <h2 className="text-body font-semibold text-lg md:text-xl mt-6 mb-4 text-black-text">
            Marca los ahorros cumplidos
          </h2>
          {dataBoxes && dataBoxes.length > 0 ? (
            <ul>
              {dataBoxes.map((checkbox, index) => (
                <li key={index}>
                  <label>
                    <input
                      type="checkbox"
                      checked={checkbox.checked}
                      onChange={(e) =>
                        handleCheckboxChange(index, e.target.checked)
                      }
                      className="w-4 h-4 text-primary-color bg-gray-100 border-gray-300 rounded focus:ring-transparent"
                    />
                    {checkbox.dateRange}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay datos de fechas disponibles.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ViewDetails;