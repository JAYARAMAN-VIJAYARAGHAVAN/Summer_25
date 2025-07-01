package com.example.hms.repository;

import com.example.hms.entity.Appointment;
import com.example.hms.entity.Appointment.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Existing custom query for booked patient appointments
    @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor JOIN FETCH a.patient WHERE a.patient.id = :patientId AND a.status = 'BOOKED'")
    List<Appointment> findByPatientIdAndStatusBooked(@Param("patientId") Long patientId);

    // Existing custom query for booked doctor appointments
    @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor JOIN FETCH a.patient WHERE a.doctor.id = :doctorId AND a.status = 'BOOKED'")
    List<Appointment> findByDoctorIdAndStatusBooked(@Param("doctorId") Long doctorId);

    // New methods required by the service
    List<Appointment> findByPatientIdAndStatus(Long patientId, Status status);
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, Status status);
    List<Appointment> findByStatus(Status status);

       @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor JOIN FETCH a.patient WHERE a.doctor.id = :doctorId AND a.status = 'COMPLETED'")
    List<Appointment> findCompletedByDoctorIdWithDetails(@Param("doctorId") Long doctorId);
    
    // Existing method
    Optional<Appointment> findById(Long id);

    List<Appointment> findByDoctorIdAndStartTimeBetween(Long doctorId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND DATE(a.startTime) = :date")
    List<Appointment> findByDoctorIdAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);


    @Query("SELECT a FROM Appointment a WHERE a.status IN :statuses")
    List<Appointment> findByStatusIn(@Param("statuses") List<Appointment.Status> statuses);

    List<Appointment> findByPatientId(Long patientId);

    void deleteById(Long appointmentId);
    boolean existsById(Long appointmentId);

}
